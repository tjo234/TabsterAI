import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import TabEditor from "@/pages/tab-editor";
import TabViewer from "@/pages/tab-viewer";
import PlaylistManager from "@/pages/playlist-manager";
import Browse from "@/pages/browse";
import MyTabs from "@/pages/my-tabs";
import MyPlaylists from "@/pages/my-playlists";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tab/new" component={TabEditor} />
          <Route path="/tab/:id/edit" component={TabEditor} />
          <Route path="/tab/:id" component={TabViewer} />
          <Route path="/playlist/:id" component={PlaylistManager} />
          <Route path="/browse/:category" component={Browse} />
          <Route path="/tabs" component={MyTabs} />
          <Route path="/playlists" component={MyPlaylists} />
          <Route path="/favorites" component={MyTabs} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
