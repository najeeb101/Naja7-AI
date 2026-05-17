import logo from "@/assets/logo.png";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="NAJA7" className="h-10 w-auto" />
          </div>

          <div className="hidden text-sm text-muted-foreground sm:block">
            AI contract review demo
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
