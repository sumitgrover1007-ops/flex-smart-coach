import { useState } from "react";
import ScrollNav from "@/components/ScrollNav";
import SimpleDashboard from "@/components/SimpleDashboard";
import DailyCheckin from "@/components/DailyCheckin";
import SimpleWorkouts from "@/components/SimpleWorkouts";
import SimpleNutrition from "@/components/SimpleNutrition";
import SimpleProgress from "@/components/SimpleProgress";
import AIChat from "@/components/AIChat";
import PostureCorrection from "@/components/PostureCorrection";
import PostureDetection from "@/components/PostureDetection";

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleNavigateToCheckin = () => {
    setActiveSection("checkin");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <SimpleDashboard onNavigateToCheckin={handleNavigateToCheckin} />;
      case "checkin":
        return <DailyCheckin />;
      case "workouts":
        return <SimpleWorkouts />;
      case "nutrition":
        return <SimpleNutrition />;
      case "chat":
        return <AIChat />;
      case "progress":
        return <SimpleProgress />;
      case "posture":
        return <PostureCorrection onNavigateToDetection={() => setActiveSection("detection")} />;
      case "detection":
        return <PostureDetection />;
      default:
        return <SimpleDashboard onNavigateToCheckin={handleNavigateToCheckin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollNav 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="pt-0">
        {renderSection()}
      </div>
    </div>
  );
};

export default DashboardPage;