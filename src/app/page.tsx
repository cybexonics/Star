import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-[#590D22] tracking-tight">
                STAR TAILORS
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-[#800F2F]">
                Craftsmanship Meets Precision
              </h2>
              <p className="text-lg lg:text-xl text-[#800F2F] max-w-2xl leading-relaxed">
                Streamline your tailoring business with our all-in-one management system designed for artisans who value quality and efficiency.
              </p>
            </div>
            
            <div className="space-y-4">
              <ul className="space-y-3 text-lg">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] rounded-full"></span>
                  <span className="text-[#800F2F]">Effortless invoicing and payment tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] rounded-full"></span>
                  <span className="text-[#800F2F]">Personalized customer service management</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] rounded-full"></span>
                  <span className="text-[#800F2F]">Seamless tailor coordination system</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Navigation Buttons */}
          <div className="flex justify-center lg:justify-end">
            <div className="card max-w-md w-full">
              <h3 className="heading text-2xl text-center mb-8">
                Select Your Department
              </h3>
              
              <div className="space-y-4">
                <Link 
                  href="/admin"
                  className="btn-primary block w-full text-center py-4 text-lg"
                >
                  Go to Admin Dashboard
                </Link>
                
                <Link 
                  href="/billing"
                  className="btn-primary block w-full text-center py-4 text-lg"
                >
                  Open Billing System
                </Link>
                
                <Link 
                  href="/workflow"
                  className="btn-primary block w-full text-center py-4 text-lg"
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