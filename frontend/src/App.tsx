  import { useEffect } from 'react';
  import { useThemeStore } from './store/theme.store';
  import { AppRouter } from './routes';
  import { Toaster } from 'sonner';
  import {queryClient} from "@/lib/queryClient.ts";
  import {QueryClientProvider} from "@tanstack/react-query";

  function App() {
    const { theme } = useThemeStore();

    useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

      return (
          <QueryClientProvider client={queryClient}>
              <AppRouter />
              <Toaster position="top-right" richColors />
          </QueryClientProvider>
      );
  }

  export default App;
