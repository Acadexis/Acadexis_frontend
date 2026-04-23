import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

export default function StudentDashboardLayout({ children }) {
  return (
    <DashboardLayout
      userName="Athenaeum Portal"
      userSubtitle="Undergraduate Studies"
      userInitials="JD"
      avatarColor="bg-orange-400"
      notificationCount={2}
    >
      {children}
    </DashboardLayout>
  );
}