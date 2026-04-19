import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Measurements from "@/pages/measurements";
import MeasurementsNew from "@/pages/measurements-new";
import Signs from "@/pages/signs";
import SignsNew from "@/pages/signs-new";
import SignDetail from "@/pages/sign-detail";
import Routes from "@/pages/routes";
import RoutesNew from "@/pages/routes-new";
import Alerts from "@/pages/alerts";
import Reports from "@/pages/reports";
import Analyze from "@/pages/analyze";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/measurements" component={Measurements} />
      <Route path="/measurements/new" component={MeasurementsNew} />
      <Route path="/signs/new" component={SignsNew} />
      <Route path="/signs/:id">
        {(params) => <SignDetail id={params.id} />}
      </Route>
      <Route path="/signs" component={Signs} />
      <Route path="/routes/new" component={RoutesNew} />
      <Route path="/routes" component={Routes} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/reports" component={Reports} />
      <Route path="/analyze" component={Analyze} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
