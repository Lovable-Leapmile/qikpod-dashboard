const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-blue-50 dark:from-background dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-8 overflow-hidden">
      <div className="relative w-full max-w-6xl h-[600px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Testing App
          </h1>
          <p className="text-2xl text-muted-foreground">
            leapmile robotics
          </p>
        </div>
        
        {/* Box 1 - Purple - Floating */}
        <div 
          className="absolute top-20 left-20 w-24 h-24 rounded-2xl shadow-lg animate-float"
          style={{ backgroundColor: 'hsl(var(--box-1))' }}
        />
        
        {/* Box 2 - Cyan - Horizontal Slide */}
        <div 
          className="absolute top-40 right-32 w-28 h-28 rounded-2xl shadow-lg animate-slide-horizontal"
          style={{ backgroundColor: 'hsl(var(--box-2))' }}
        />
        
        {/* Box 3 - Green - Rotating */}
        <div 
          className="absolute bottom-32 left-40 w-32 h-32 rounded-2xl shadow-lg animate-spin-slow"
          style={{ backgroundColor: 'hsl(var(--box-3))' }}
        />
        
        {/* Box 4 - Orange - Bouncing */}
        <div 
          className="absolute bottom-20 right-20 w-24 h-24 rounded-2xl shadow-lg animate-bounce-slow"
          style={{ backgroundColor: 'hsl(var(--box-4))' }}
        />
        
        {/* Box 5 - Pink - Diagonal Movement */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl shadow-lg animate-diagonal"
          style={{ backgroundColor: 'hsl(var(--box-5))' }}
        />
      </div>
    </div>
  );
};

export default Index;
