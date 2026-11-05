import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '../components/Hero';
import FeaturedProductsSection from '../components/FeaturedProductsSection';
import GolfCoursesSection from '../components/GolfCoursesSection';
import MembershipPlansSection from '../components/MembershipPlansSection';
import NewsletterSection from '../components/NewsletterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header transparent dark />

      <main>
        <Hero />
        <FeaturedProductsSection />
        <GolfCoursesSection />
        <MembershipPlansSection />
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
