import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="NAJA7" className="h-10 w-auto" />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#product" className="text-foreground hover:text-primary transition-colors">
              Product
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#resources" className="text-foreground hover:text-primary transition-colors">
              Resources
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost">
              Log in
            </Button>
            <Button>
              Book a demo
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
