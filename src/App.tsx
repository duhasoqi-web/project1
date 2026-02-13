import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Layout} from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddBook from "./pages/AddBook";
import Books from "./pages/Books";
import SearchBooks from "./pages/SearchBooks";
import Reports from "./pages/Reports";
import DeleteBooks from "./pages/DeleteBooks";
import BarcodeBooks from "./pages/BarcodeBooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/books" element={<Books />} />
            <Route path="/search" element={<SearchBooks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/delete" element={<DeleteBooks />} />
            <Route path="/barcode" element={<BarcodeBooks />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
