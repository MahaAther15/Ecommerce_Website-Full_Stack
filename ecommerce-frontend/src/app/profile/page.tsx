import MainLayout from "@/app/Components/Layout/MainLayout";
import ProfileDashboard from "./ProfileDashboard";
import "./profile.css";
export const metadata = {
    title: "My Account & Profile | Cara Ecommerce",
    description: "Manage your profile, shipping addresses, order tracking, and account settings.",
};

export default function ProfilePage() {
    return <ProfileDashboard />;
}
