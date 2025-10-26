import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
          Transform Your Business with{" "}
          <span className="text-primary">NAJA7</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          The powerful platform that helps you build meaningful connections 
          and drive results for your business.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-6 shadow-medium hover:shadow-lg transition-all">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            Learn More
          </Button>
        </div>

        <div className="mt-16 bg-card rounded-2xl shadow-medium p-8 border border-border">
          <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Your product demo or key visual here</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
