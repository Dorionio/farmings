"use client";

import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, Play, Globe } from 'lucide-react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayTour: () => void;
  role: 'owner' | 'staff';
  language: 'en' | 'fr' | 'es' | 'ar';
}

const faqs = [
  {
    id: 'boarding-checkin',
    question: {
      en: "How do I check in a new boarding guest?",
      fr: "Comment enregistrer un pensionnaire ?",
      es: "¿Cómo registro la entrada de un huésped?",
      ar: "كيف يمكنني تسجيل دخول نزيل إيواء جديد؟"
    },
    steps: {
      en: [
        "Go to Boarding Guests from the sidebar menu.",
        "Click the Check In Guest button at the top right of the page.",
        "Select the pet's name, choose their assigned Kennel Run, enter the stay dates, and click Confirm Check-in."
      ],
      fr: [
        "Allez dans l'onglet Pensionnaires depuis le menu.",
        "Cliquez sur le bouton Enregistrer un pensionnaire en haut à droite.",
        "Sélectionnez le nom de l'animal, choisissez le chenil, entrez les dates et validez."
      ],
      es: [
        "Vaya a Huéspedes de Hospedaje en el menú lateral.",
        "Haga clic en Registrar Entrada en la esquina superior derecha.",
        "Seleccione la mascota, asigne un canil, ingrese las fechas y haga clic en Confirmar."
      ],
      ar: [
        "انتقل إلى نزلاء الإيواء من القائمة الجانبية.",
        "انقر فوق زر تسجيل دخول النزيل في الجزء العلوي الأيمن من الصفحة.",
        "اختر اسم الأليف، وحدد الحظيرة المخصصة له، وأدخل تواريخ الإقامة، ثم انقر فوق تأكيد الدخول."
      ]
    }
  },
  {
    id: 'health-charts',
    question: {
      en: "How do I log a vaccination or medication?",
      fr: "Comment ajouter un vaccin ou un traitement ?",
      es: "¿Cómo registro una vacuna o medicamento?",
      ar: "كيف أسجل لقاحًا أو دواءً للحيوان؟"
    },
    steps: {
      en: [
        "Go to the Animals directory and click on the animal's profile card.",
        "Scroll to the Health Center section of their profile.",
        "Click Add Vaccination or Add Medication, fill out the info, and click save."
      ],
      fr: [
        "Allez dans l'Annuaire des Animaux et cliquez sur sa fiche.",
        "Faites défiler jusqu'à la section Centre de Santé.",
        "Cliquez sur Ajouter un Vaccin ou Ajouter un Médicament, remplissez les informations et enregistrez."
      ],
      es: [
        "Vaya a Animales y haga clic en el perfil del animal.",
        "Baje hasta la sección Centro de Salud del perfil.",
        "Haga clic en Agregar Vacuna o Agregar Medicamento, complete los datos y guarde."
      ],
      ar: [
        "انتقل إلى دليل الحيوانات وانقر على بطاقة تعريف الحيوان.",
        "مرر لأسفل إلى قسم المركز الصحي في ملفه الشخصي.",
        "انقر فوق إضافة لقاح أو إضافة دواء، واملأ التفاصيل، ثم انقر فوق حفظ."
      ]
    }
  },
  {
    id: 'staff-invite',
    roleRequired: 'owner',
    question: {
      en: "How do I invite a staff member?",
      fr: "Comment inviter un membre de l'équipe ?",
      es: "¿Cómo invito a un miembro del personal?",
      ar: "كيف أقوم بدعوة موظف جديد؟"
    },
    steps: {
      en: [
        "Open the Staff page from the sidebar menu.",
        "Choose the role level (Staff or Co-Owner) and click the Generate Invitation Link button.",
        "Copy the unique link and share it directly with your employee via WhatsApp or email."
      ],
      fr: [
        "Ouvrez la page Équipe depuis le menu latéral.",
        "Sélectionnez le rôle (Employé ou Co-propriétaire) et cliquez sur Générer un lien d'invitation.",
        "Copiez le lien unique et partagez-le par WhatsApp ou e-mail."
      ],
      es: [
        "Abra la página Personal desde el menú lateral.",
        "Elija el rol (Personal o Co-propietario) y haga clic en Generar Enlace de Invitación.",
        "Copie el enlace y compártalo directamente por WhatsApp o correo electrónico."
      ],
      ar: [
        "افتح صفحة الموظفين من القائمة الجانبية.",
        "اختر مستوى الدور (موظف أو شريك مالك) وانقر على زر إنشاء رابط الدعوة.",
        "انسخ الرابط الفريد وشاركه مباشرة مع موظفك عبر واتساب أو البريد الإلكتروني."
      ]
    }
  },
  {
    id: 'breeding-track',
    question: {
      en: "How do I track a breeding cycle?",
      fr: "Comment suivre un cycle d'élevage ?",
      es: "¿Cómo realizo el seguimiento de cría?",
      ar: "كيف أتتبع دورات التزاوج والحمل؟"
    },
    steps: {
      en: [
        "Open the Breeding Center from the sidebar.",
        "Click Track Pregnancy, Log Mating, or add a Heat Cycle depending on the event.",
        "Save dates to automatically track expected gestation calendars and litter deadlines."
      ],
      fr: [
        "Ouvrez le Centre d'élevage depuis le menu latéral.",
        "Cliquez sur Suivre une Gestation, Accouplement ou Chaleurs.",
        "Enregistrez les dates pour calculer automatiquement les calendriers de gestation."
      ],
      es: [
        "Abra el Centro de Cría en el menú lateral.",
        "Haga clic en Seguir Gestación, Registrar Apareamiento o Ciclo de Celo.",
        "Guarde las fechas para calcular automáticamente los plazos de gestación."
      ],
      ar: [
        "افتح مركز التربية من القائمة الجانبية.",
        "انقر على تتبع الحمل، أو تسجيل تزاوج، أو إضافة دورة شبق بناءً على الحدث.",
        "احفظ التواريخ لتتبع تقويم الحمل المتوقع ومواعيد ولادة البطن تلقائيًا."
      ]
    }
  }
];

export const HelpCenter: React.FC<HelpCenterProps> = ({
  isOpen,
  onClose,
  onReplayTour,
  role,
  language
}) => {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRtl = language === 'ar';

  const tHelp = (key: string) => {
    const translations: any = {
      en: {
        title: "Help Center",
        subtitle: "Learn how to use DorionAnima SaaS easily",
        replay_tour: "Replay Welcome Tour",
        faq_header: "Frequently Asked Questions",
        close: "Close"
      },
      fr: {
        title: "Centre d'Aide",
        subtitle: "Apprenez à utiliser DorionAnima SaaS facilement",
        replay_tour: "Relancer le Guide de Bienvenue",
        faq_header: "Questions Fréquentes",
        close: "Fermer"
      },
      es: {
        title: "Centro de Ayuda",
        subtitle: "Aprenda a usar DorionAnima SaaS fácilmente",
        replay_tour: "Recomenzar Visita Guiada",
        faq_header: "Preguntas Frecuentes",
        close: "Cerrar"
      },
      ar: {
        title: "مركز المساعدة",
        subtitle: "تعلم كيفية استخدام دوريون أنيما بسهولة",
        replay_tour: "إعادة جولة الترحيب",
        faq_header: "الأسئلة الشائعة",
        close: "إغلاق"
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  const filteredFaqs = faqs.filter(faq => !faq.roleRequired || faq.roleRequired === role);

  const toggleFaq = (id: string) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans flex justify-end">
      {/* Semi-transparent Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Body Panel */}
      <div className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 transition-all duration-300 transform translate-x-0 ${
        isRtl ? 'left-0 border-r border-slate-100' : 'right-0 border-l border-slate-100'
      } text-xs font-medium text-slate-700 ltr:text-left rtl:text-right`}>
        
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{tHelp('title')}</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5">{tHelp('subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DRAWER MAIN SCROLL VIEW */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Replay Tour Widget */}
          <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-emerald-950 text-xs block">
                {language === 'ar' ? 'هل تريد جولة سريعة؟' : language === 'es' ? '¿Desea una guía rápida?' : language === 'fr' ? 'Besoin d\'un guide rapide ?' : 'Need a quick refresher?'}
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">
                {language === 'ar' ? 'أعد تشغيل الدليل التفاعلي في أي وقت.' : language === 'es' ? 'Inicie el recorrido por el menú.' : language === 'fr' ? 'Relancez le guide interactif.' : 'Restart the interactive tour anytime.'}
              </span>
            </div>
            <button
              onClick={() => { onClose(); onReplayTour(); }}
              className="flex items-center justify-center px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 mr-1.5 ltr:mr-1.5 rtl:ml-1.5 fill-current" />
              {tHelp('replay_tour')}
            </button>
          </div>

          {/* FAQ Accordion Lists */}
          <div className="space-y-4">
            <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold border-b border-slate-100 pb-2">
              {tHelp('faq_header')}
            </h4>
            
            <div className="divide-y divide-slate-100">
              {filteredFaqs.map(faq => {
                const questionText = faq.question[language] || faq.question.en;
                const stepsList = faq.steps[language] || faq.steps.en;
                const isExpanded = expandedFaq === faq.id;

                return (
                  <div key={faq.id} className="py-3">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between text-left font-bold text-slate-900 hover:text-emerald-800 transition-colors py-1 cursor-pointer text-xs"
                    >
                      <span className="pr-4 ltr:pr-4 rtl:pl-4">{questionText}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <ol className="mt-3.5 space-y-2.5 list-decimal list-inside text-slate-600 leading-relaxed font-semibold pl-1.5 animate-fade-in text-[11px]">
                        {stepsList.map((stepDesc, idx) => (
                          <li key={idx} className="marker:text-emerald-700 marker:font-bold">
                            <span className="ltr:ml-1.5 rtl:mr-1.5">{stepDesc}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DRAWER FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {tHelp('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
