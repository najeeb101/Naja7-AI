const Hero = () => {
  return (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          <span className="text-foreground">Analyze your Contracts</span>
          <br />
          <span className="text-muted-foreground">with </span>
          <span className="text-primary">Naja7</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Upload your PDF and Word documents to extract, analyze, and understand contract content with AI-powered insights.
        </p>
      </div>
    </section>
  );
};

export default Hero;
