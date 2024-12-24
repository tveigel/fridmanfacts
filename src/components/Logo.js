import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Logo = ({ className = '' }) => {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push('/')} 
      className={`cursor-pointer flex items-center ${className}`}
    >
      <Image
        src="/CommunityFacts.png"
        alt="Community Facts Logo"
        width={48} // 48px matches h-12
        height={48}
        className="h-12 w-auto"
      />
    </div>
  );
};

export default Logo;