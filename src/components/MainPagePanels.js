import React from 'react';
import { Info, Check, Flag, MessageSquare, ThumbsUp } from 'lucide-react';

const InfoPanel = ({ title, children, icon: Icon }) => (
  <div className="bg-black text-white rounded-2xl p-8 h-full">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function MainPagePanels() {
  return (
    <div className="max-w-6xl mx-auto px-7 py-12">
      {/* Hero Section (your existing one) */}
      <div className="bg-black text-white rounded-2xl p-12 mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Community-Driven Fact Checking
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Join our community in verifying and discussing the accuracy of information 
          shared in popular podcasts and interviews.
        </p>
      </div>

      {/* New Info Panels Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Mission Panel */}
        <InfoPanel title="Our Mission" icon={Info}>
          <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed">
            In today&apos;s era of long-form podcasts and interviews, valuable insights often 
            mix with unverified claims. Our platform empowers listeners to collaboratively 
            verify information, provide context, and engage in meaningful discussions.
          </p>
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Key Objectives:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  Promote accuracy in long-form content
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  Foster thoughtful, informed discussions
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  Build a trusted knowledge base
                </li>
              </ul>
            </div>
          </div>
        </InfoPanel>

        {/* How It Works Panel */}
        <InfoPanel title="How It Works" icon={Flag}>
          <div className="space-y-6">
          <p className="text-gray-300 mb-6">
            Our platform makes fact-checking collaborative and engaging. Here&apos;s how 
            you can participate:
          </p>
                      <div className="space-y-6">
              <Feature
                icon={Flag}
                title="Submit Fact Checks"
                description="Highlight any part of a transcript and submit a fact check with sources and context."
              />
              <Feature
                icon={ThumbsUp}
                title="Vote and Validate"
                description="Help identify accurate fact checks by voting. Build reputation through quality contributions."
              />
              <Feature
                icon={MessageSquare}
                title="Join the Discussion"
                description="Engage with others through comments and contribute to meaningful conversations."
              />
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full">
                Get Started
              </button>
            </div>
          </div>
        </InfoPanel>
      </div>
    </div>
  );
}