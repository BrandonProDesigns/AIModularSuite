import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member } from "@/lib/supabase";

interface Props {
  member: Member;
}

export function MemberCard({ member }: Props) {
  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-16 w-16">
        {member.avatar_url ? (
          <AvatarImage src={member.avatar_url} alt={member.name} />
        ) : (
          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        )}
      </Avatar>
      <span className="mt-2 text-sm">{member.name}</span>
    </div>
  );
}

export default MemberCard;
