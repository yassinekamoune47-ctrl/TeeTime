import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

interface GolfBall3DProps {
  sectionRef: RefObject<HTMLElement | null>;
}

const CAMERA_DISTANCE = 8;
const CAMERA_FOV = 36;

function createDimpledGeometry(segments: number, dimpleCount: number): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, segments, segments);
  const position = geometry.attributes.position as THREE.BufferAttribute;

  const centers = new Float32Array(dimpleCount * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < dimpleCount; i += 1) {
    const y = 1 - (i / (dimpleCount - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    centers[i * 3] = Math.cos(theta) * ring;
    centers[i * 3 + 1] = y;
    centers[i * 3 + 2] = Math.sin(theta) * ring;
  }

  const dimpleAngle = 0.095;
  const cosRadius = Math.cos(dimpleAngle);
  const inverseSpan = 1 / (1 - cosRadius);
  const depth = 0.035;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i).normalize();

    let deepest = 0;
    for (let d = 0; d < dimpleCount; d += 1) {
      const dot =
        vertex.x * centers[d * 3] +
        vertex.y * centers[d * 3 + 1] +
        vertex.z * centers[d * 3 + 2];

      if (dot > cosRadius) {
        const t = (dot - cosRadius) * inverseSpan;
        const smooth = t * t * (3 - 2 * t);
        if (smooth > deepest) deepest = smooth;
      }
    }

    if (deepest > 0) {
      const scale = 1 - depth * deepest;
      position.setXYZ(i, vertex.x * scale, vertex.y * scale, vertex.z * scale);
    }
  }

  geometry.computeVertexNormals();
  return geometry;
}

export default function GolfBall3D({ sectionRef }: GolfBall3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCompact = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 60);
    camera.position.set(0, 0, CAMERA_DISTANCE);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const geometry = createDimpledGeometry(isCompact ? 128 : 192, isCompact ? 200 : 300);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.02,
      clearcoat: 0.65,
      clearcoatRoughness: 0.32,
      sheen: 0.25,
      sheenColor: new THREE.Color(0xf6ecd0),
    });

    const ball = new THREE.Mesh(geometry, material);
    ball.castShadow = true;

    const ballGroup = new THREE.Group();
    ballGroup.add(ball);
    scene.add(ballGroup);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 36),
      new THREE.ShadowMaterial({ color: 0x04110b, opacity: 0.42 }),
    );
    shadowPlane.position.set(0, 0, -1.5);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x0b241b, 1.1);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 3.1);
    keyLight.position.set(5, 7, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0006;
    keyLight.shadow.radius = 5;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9fd8b8, 1.6);
    fillLight.position.set(-7, -3, 5);
    scene.add(fillLight);

    const goldLight = new THREE.PointLight(0xd4af37, 14, 18, 2);
    goldLight.position.set(-1.5, -3.5, 5);
    scene.add(goldLight);

    const resting = new THREE.Vector3();
    const target = new THREE.Vector3();
    const previous = new THREE.Vector3();
    const velocity = new THREE.Vector2();
    const idleAxis = new THREE.Vector3(0.18, 1, 0.12).normalize();
    const rollAxis = new THREE.Vector3();

    let radius = 1;
    let maxX = 2;
    let maxY = 1;
    let minY = -1;
    let visible = true;
    let disposed = false;
    let frame = 0;
    const clock = new THREE.Clock();

    const updateBounds = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);

      const viewHeight = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_DISTANCE;
      const viewWidth = viewHeight * camera.aspect;
      // Narrow screens place the ball above the copy instead of behind it.
      const narrow = width < 640;

      const scale = THREE.MathUtils.clamp(
        Math.min(viewWidth, viewHeight) / (narrow ? 6.8 : 5.6),
        narrow ? 0.36 : 0.55,
        1.05,
      );
      ballGroup.scale.setScalar(scale);
      radius = scale;

      maxX = Math.max(0.35, viewWidth / 2 - radius - 0.35);
      maxY = Math.max(0.35, viewHeight / 2 - radius - 0.35);
      minY = narrow ? 0 : -maxY;

      resting.set(
        Math.min(viewWidth * 0.17, maxX * 0.7),
        narrow ? Math.min(viewHeight * 0.3, maxY) : Math.min(viewHeight * 0.04, maxY * 0.35),
        0,
      );
      target.copy(resting);

      ballGroup.position.x = THREE.MathUtils.clamp(ballGroup.position.x, -maxX, maxX);
      ballGroup.position.y = THREE.MathUtils.clamp(ballGroup.position.y, minY, maxY);
    };

    updateBounds();
    ballGroup.position.copy(resting);

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion) return;
      const rect = section.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      target.set(
        THREE.MathUtils.clamp(nx * maxX, -maxX, maxX),
        THREE.MathUtils.clamp(ny * maxY, minY, maxY),
        0,
      );
    };

    const handlePointerLeave = () => {
      target.copy(resting);
    };

    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave);

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(section);

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);

      if (!visible || document.hidden) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (!reducedMotion) {
        velocity.x += (target.x - ballGroup.position.x) * 42 * dt;
        velocity.y += (target.y - ballGroup.position.y) * 42 * dt;
        const damping = Math.exp(-10.5 * dt);
        velocity.multiplyScalar(damping);

        previous.copy(ballGroup.position);
        ballGroup.position.x += velocity.x * dt;
        ballGroup.position.y += velocity.y * dt;

        if (Math.abs(ballGroup.position.x) > maxX) {
          ballGroup.position.x = THREE.MathUtils.clamp(ballGroup.position.x, -maxX, maxX);
          velocity.x = 0;
        }
        if (Math.abs(ballGroup.position.y) > maxY || ballGroup.position.y < minY) {
          ballGroup.position.y = THREE.MathUtils.clamp(ballGroup.position.y, minY, maxY);
          velocity.y = 0;
        }

        const dx = ballGroup.position.x - previous.x;
        const dy = ballGroup.position.y - previous.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.00002) {
          rollAxis.set(-dy, dx, 0).normalize();
          ballGroup.rotateOnWorldAxis(rollAxis, distance / radius);
        }

        ballGroup.rotateOnWorldAxis(idleAxis, 0.09 * dt);
        ball.position.y = Math.sin(elapsed * 0.9) * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      shadowPlane.geometry.dispose();
      (shadowPlane.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [sectionRef]);

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0 z-0" />;
}
