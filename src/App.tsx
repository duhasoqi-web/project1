import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Layout} from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddBook from "./pages/AddBook";
import Books from "./pages/Books";
import Barcode from "./pages/BarcodeBooks";
import Search from "./pages/SearchBooks";
import Reports from "./pages/Reports";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

     <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/update-books" element={<Books/>}/>
            <Route path="/Barcode" element={<Barcode/>}/>
             <Route path="/Search" element={<Search/>}/>
             <Route path="/Reports" element={<Reports/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
