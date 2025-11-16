import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Updated background with gradient and abstract shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Left side gradient background */}
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-purple-600 to-pink-500"></div>
        
        {/* Subtle abstract shapes on the right */}
        <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-purple-300 opacity-20 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/2 w-48 h-48 rounded-full bg-pink-300 opacity-20 blur-3xl"></div>
        <div className="absolute right-1/3 bottom-1/4 w-32 h-32 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 lg:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              {/* Updated premium hero icon */}
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg">
                STAR TAILORS
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-white/90 drop-shadow-md">
                Craftsmanship Meets Precision
              </h2>
              <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed drop-shadow-sm">
                Streamline your tailoring business with our all-in-one management system designed for artisans who value quality and efficiency.
              </p>
            </div>
            
            <div className="space-y-4">
              <ul className="space-y-3 text-lg">
                <li className="flex items-center space-x-3">
                  <span className="w-3 h-3 bg-white rounded-full shadow-sm"></span>
                  <span className="text-white/90 drop-shadow-sm">Effortless invoicing and payment tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-3 h-3 bg-white rounded-full shadow-sm"></span>
                  <span className="text-white/90 drop-shadow-sm">Personalized customer service management</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-3 h-3 bg-white rounded-full shadow-sm"></span>
                  <span className="text-white/90 drop-shadow-sm">Seamless tailor coordination system</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Navigation Buttons */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
                Select Your Department
              </h3>
              
              <div className="space-y-5">
                <Link 
                  href="/admin"
                  className="block w-full text-center py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600"
                >
                  Go to Admin Dashboard
                </Link>
                
                <Link 
                  href="/billing"
                  className="block w-full text-center py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600"
                >
                  Open Billing System
                </Link>
                
                <Link 
                  href="/workflow"
                  className="block w-full text-center py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600"
                >
                  Garment Workflow Management
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}