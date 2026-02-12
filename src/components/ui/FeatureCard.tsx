import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
  gradient: string;
  iconColor: string;
  borderColor: string;
}

/**
 * Memoized feature card component for dashboard and landing page.
 * Prevents unnecessary re-renders since feature data is static.
 */
const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
  gradient,
  iconColor,
  borderColor,
}: FeatureCardProps) {
  return (
    <div className="card hover-lift border-0 bg-white">
      <div className="p-8">
        <div
          className={`w-20 h-20 rounded-xl bg-gradient-to-br ${gradient} ${borderColor} border flex items-center justify-center mb-6`}
        >
          <Icon className={`h-10 w-10 ${iconColor}`} />
        </div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
        <Link to={href} className="btn btn-outline w-full dashboard-btn">
          {cta}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
});

export default FeatureCard;
