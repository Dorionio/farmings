"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'owner' | 'staff';
  language: 'en' | 'fr' | 'es' | 'ar';
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const steps = [
  {
    targetId: 'tour-nav-dashboard',
    title: {
      en: "📊 Dashboard Overview",
      fr: "📊 Aperçu du Tableau de bord",
      es: "📊 Panel de Control",
      ar: "📊 لوحة القيادة"
    },
    desc: {
      en: "Your business overview at a glance. See active guests, today's tasks count, and urgent alerts here.",
      fr: "Aperçu de votre activité en un coup d'œil. Visualisez les pensionnaires actifs, les tâches du jour et les alertes urgentes.",
      es: "Resumen de su negocio a simple vista. Vea huéspedes activos, cantidad de tareas de hoy y alertas urgentes aquí.",
      ar: "نظرة عامة على عملك في لمحة. شاهد النزلاء النشطين، وعدد مهام اليوم، والتنبيهات العاجلة هنا."
    }
  },
  {
    targetId: 'tour-nav-animals',
    title: {
      en: "🐶 Animals Directory",
      fr: "🐶 Annuaire des animaux",
      es: "🐶 Directorio de Animales",
      ar: "🐶 دليل الحيوانات"
    },
    desc: {
      en: "Create and view detailed animal profiles. Track microchip IDs, medical charts, and owner details in one place.",
      fr: "Créez et consultez les profils détaillés des animaux. Suivez les puces électroniques, les dossiers médicaux et les coordonnées des propriétaires.",
      es: "Cree y vea perfiles detallados de animales. Realice un seguimiento de microchips, registros médicos y datos del dueño en un solo lugar.",
      ar: "إنشاء وعرض ملفات تعريف الحيوانات التفصيلية. تتبع أرقام الميكروشب، والملفات الطبية، وتفاصيل المالك في مكان واحد."
    }
  },
  {
    targetId: 'tour-nav-boarding',
    title: {
      en: "🏨 Boarding & Kennels",
      fr: "🏨 Pension & Chenils",
      es: "🏨 Hospedaje y Caniles",
      ar: "🏨 الإيواء والحظائر"
    },
    desc: {
      en: "Check pets in and out of active kennel runs, view vacancy stats, and schedule upcoming stays.",
      fr: "Enregistrez les arrivées et départs des animaux, consultez les places disponibles et planifiez les séjours à venir.",
      es: "Registre la entrada y salida de mascotas de los caniles activos, vea estadísticas de vacantes y programe próximas estadías.",
      ar: "تسجيل دخول وخروج الحيوانات الأليفة من الحظائر النشطة، وعرض إحصائيات الشواغر، وجدولة الإقامات القادمة."
    }
  },
  {
    targetId: 'tour-nav-checklist',
    title: {
      en: "📋 Daily Checklist",
      fr: "📋 Corvées quotidiennes",
      es: "📋 Tareas Diarias",
      ar: "📋 المهام اليومية"
    },
    desc: {
      en: "Manage feeding times, exercise routines, and medication schedules. Check off chores as you complete them.",
      fr: "Gerez les heures de repas, les exercices et la distribution de médicaments. Cochez les tâches au fur et à mesure.",
      es: "Gestione horarios de alimentación, rutinas de ejercicio y medicamentos. Marque las tareas a medida que las complete.",
      ar: "إدارة أوقات التغذية، وروتين التمارين، وجداول الأدوية. قم بوضع علامة على المهام عند إكمالها."
    }
  },
  {
    targetId: 'tour-nav-breeding',
    title: {
      en: "🧬 Breeding Center",
      fr: "🧬 Centre d'élevage",
      es: "🧬 Centro de Cría",
      ar: "🧬 مركز التربية"
    },
    desc: {
      en: "Track active heat cycles, mating logs, expected gestation dates, and litter birth records.",
      fr: "Suivez les cycles de chaleurs, les accouplements, les dates de gestation prévues et les portées.",
      es: "Siga ciclos de celo, registros de apareamiento, fechas de gestación esperadas y registros de camadas.",
      ar: "تتبع دورات الشبق النشطة، وسجلات التزاوج، وتواريخ الحمل المتوقعة، وسجلات ولادة البطن."
    }
  },
  {
    targetId: 'tour-nav-staff',
    title: {
      en: "👥 Staff Directory",
      fr: "👥 Équipe & Invites",
      es: "👥 Directorio de Personal",
      ar: "👥 دليل الموظفين"
    },
    desc: {
      en: "Generate invitation links to bring your team onboard. Assign helper roles to delegate task checklists.",
      fr: "Générez des liens d'invitation pour intégrer votre équipe. Assignez des rôles pour déléguer les listes de tâches.",
      es: "Genere enlaces de invitación para incorporar a su equipo. Asigne roles de ayuda para delegar listas de tareas.",
      ar: "إنشاء روابط دعوة لضم فريقك. تعيين أدوار المساعدين لتفويض قوائم المهام."
    }
  }
];

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  role,
  language,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  // Filter steps based on role
  const activeSteps = steps.filter(s => s.targetId !== 'tour-nav-staff' || role === 'owner');

  useEffect(() => {
    if (!isOpen) return;

    // Auto-open mobile menu drawer if we are on a smaller screen
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (!isMobileMenuOpen) {
        setIsMobileMenuOpen(true);
      }
    }

    const updateSpotlight = () => {
      const step = activeSteps[currentStep];
      if (!step) return;

      const element = document.getElementById(step.targetId);
      if (element) {
        setSpotlightRect(element.getBoundingClientRect());
      } else {
        setSpotlightRect(null);
      }
    };

    // Short timeout to allow menu transition animations to finish
    const timer = setTimeout(updateSpotlight, 200);

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
    };
  }, [currentStep, isOpen, isMobileMenuOpen, activeSteps]);

  if (!isOpen) return null;

  const step = activeSteps[currentStep];
  if (!step) return null;

  const title = step.title[language] || step.title.en;
  const desc = step.desc[language] || step.desc.en;
  const isRtl = language === 'ar';

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
    setCurrentStep(0);
    onClose();
  };

  // Compute absolute tooltip styling dynamically next to spotlight bounding client rect
  let tooltipStyle: React.CSSProperties = {};
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
      if (spotlightRect) {
        tooltipStyle = {
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          top: `${Math.min(spotlightRect.bottom + 12, window.innerHeight - 260)}px`,
          width: '90%',
          maxWidth: '340px',
          zIndex: 50
        };
      } else {
        tooltipStyle = {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '340px',
          zIndex: 50
        };
      }
    } else {
      if (spotlightRect) {
        if (isRtl) {
          tooltipStyle = {
            position: 'fixed',
            right: `${window.innerWidth - spotlightRect.left + 16}px`,
            top: `${Math.min(spotlightRect.top, window.innerHeight - 240)}px`,
            width: '320px',
            zIndex: 50
          };
        } else {
          tooltipStyle = {
            position: 'fixed',
            left: `${spotlightRect.right + 16}px`,
            top: `${Math.min(spotlightRect.top, window.innerHeight - 240)}px`,
            width: '320px',
            zIndex: 50
          };
        }
      } else {
        tooltipStyle = {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          zIndex: 50
        };
      }
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-hidden font-sans">
      {/* SVG MASKING SPOTLIGHT LAYER */}
      <svg className="fixed inset-0 pointer-events-none z-40 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect 
                x={spotlightRect.left - 6} 
                y={spotlightRect.top - 6} 
                width={spotlightRect.width + 12} 
                height={spotlightRect.height + 12} 
                rx="12" 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.65)" mask="url(#spotlight-mask)" />
      </svg>

      {/* FLOATING CARD */}
      <div 
        style={tooltipStyle}
        className="bg-white text-slate-900 border border-slate-100 shadow-2xl rounded-2xl p-5 z-50 flex flex-col space-y-4 animate-fade-in text-xs ltr:text-left rtl:text-right"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h4 className="font-extrabold text-sm text-emerald-900">{title}</h4>
          <button 
            onClick={handleComplete} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-slate-600 leading-relaxed font-medium">
          {desc}
        </p>

        {/* CONTROLS */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold">
          <span className="text-slate-400">
            {currentStep + 1} / {activeSteps.length}
          </span>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1 ltr:mr-1 rtl:ml-1" />
                {language === 'ar' ? 'السابق' : language === 'es' ? 'Anterior' : language === 'fr' ? 'Précédent' : 'Back'}
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>
                {currentStep === activeSteps.length - 1 
                  ? (language === 'ar' ? 'إنهاء' : language === 'es' ? 'Finalizar' : language === 'fr' ? 'Terminer' : 'Finish')
                  : (language === 'ar' ? 'التالي' : language === 'es' ? 'Siguiente' : language === 'fr' ? 'Suivant' : 'Next')
                }
              </span>
              {currentStep < activeSteps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 ml-1 ltr:ml-1 rtl:mr-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
