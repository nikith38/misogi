import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProfileForm from "@/components/profile/profile-form";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { user } = useAuth();

  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>My Profile | MentorHub</title>
        <meta name="description" content="Manage your profile details and availability settings on MentorHub." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImage || undefined} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-neutral-default text-center md:text-left">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-neutral mt-1 text-center md:text-left">
                  {user?.title} {user?.organization ? `at ${user.organization}` : ''}
                </p>
                <p className="text-sm text-neutral-500 mt-2 text-center md:text-left">
                  {user?.role === "mentor" ? "Mentor" : "Mentee"} • {user?.email}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
