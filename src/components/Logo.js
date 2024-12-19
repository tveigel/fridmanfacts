import { useRouter } from 'next/navigation';

const Logo = ({ className = '' }) => {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push('/')} 
      className={`cursor-pointer flex items-center ${className}`}
    >
      <img 
        src="/CommunityFacts.png" 
        alt="Community Facts Logo" 
        className="h-12 w-auto"
      />
    </div>
  );
};

export default Logo;