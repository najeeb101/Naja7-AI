const Hero = () => {
  return (
    <section className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/45 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm font-medium text-primary shadow-sm">
            Private AI contract review demo
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-normal">
            <span className="text-foreground">Review contracts faster</span>
          <br />
            <span className="text-muted-foreground">with </span>
            <span className="text-primary">Naja7</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Upload a TXT, PDF, or DOCX contract to extract readable text, generate a structured risk review, and ask focused questions about the document.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="rounded-lg border bg-background/75 px-4 py-3 shadow-sm">
            Clause summary
          </div>
          <div className="rounded-lg border bg-background/75 px-4 py-3 shadow-sm">
            Risk highlights
          </div>
          <div className="rounded-lg border bg-background/75 px-4 py-3 shadow-sm">
            Document chat
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
