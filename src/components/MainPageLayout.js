import React from 'react';
import { Info, Check, Flag, MessageSquare, ThumbsUp, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const InfoPanel = ({ title, children, icon: Icon }) => (
  <div className="bg-black text-white rounded-2xl p-6 mb-6 w-full">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 bg-white/10 rounded-lg flex-shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <h3 className="font-medium text-sm mb-1">{title}</h3>
      <p className="text-gray-300 text-xs leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function MainPageLayout({ children }) {
  return (
    <div className="max-w-[1920px] mx-auto px-7 py-12">
      {/* Hero Section */}
      <div className="bg-black text-white rounded-2xl p-12 mb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Community-Driven Fact Checking
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Join our community in verifying and discussing the accuracy of information 
              shared in popular podcasts and interviews.
            </p>
          </div>
          <Image 
            src="/CommunityFacts.png" 
            alt="CommunityFacts Logo" 
            width={128}  // Adjust based on your image's actual dimensions
            height={128} // Adjust based on your image's actual dimensions
            className="h-32 w-auto"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-[350px_1fr] gap-8">
        <div>
          <InfoPanel title="Our Mission" icon={Info}>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                In today&apos;s era of long-form podcasts and interviews, valuable insights often 
                mix with unverified claims. Our platform empowers listeners to verify information
                and engage in meaningful discussions.
              </p>
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">Key Objectives:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-400" />
                    Promote accuracy in content
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-400" />
                    Foster informed discussions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-400" />
                    Build trusted knowledge
                  </li>
                </ul>
              </div>
            </div>
          </InfoPanel>

          {/* How It Works Panel */}
          <InfoPanel title="How It Works" icon={Flag}>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Our platform makes fact-checking collaborative and engaging:
              </p>
              <div className="space-y-4">
                <Feature
                  icon={Flag}
                  title="Submit Fact Checks"
                  description="Highlight transcript sections and submit fact checks with sources."
                />
                <Feature
                  icon={ThumbsUp}
                  title="Vote and Validate"
                  description="Help identify accurate fact checks and build reputation."
                />
                <Feature
                  icon={MessageSquare}
                  title="Join Discussions"
                  description="Engage with others and contribute to conversations."
                />
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors w-full">
                  Get Started
                </button>
              </div>
            </div>
          </InfoPanel>
        </div>

        {/* Main Content Area */}
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}