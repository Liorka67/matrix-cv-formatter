import React, { useState } from 'react';
import { MatrixCV } from '../types';

interface CVPreviewProps {
  cv: MatrixCV;
  language: 'he' | 'en';
  onBack: () => void;
}

const CVPreview: React.FC<CVPreviewProps> = ({ cv, language, onBack }) => {
  const [showAdditional, setShowAdditional] = useState(false);

  const formatExperience = (exp: any) => {
    const parts = [];
    if (exp.years) parts.push(exp.years);
    if (exp.role) parts.push(exp.role);
    if (exp.company) parts.push(`ב${exp.company}`);
    return parts.join(' - ');
  };

  const formatEducation = (edu: any) => {
    const parts = [];
    if (edu.degree) parts.push(edu.degree);
    if (edu.institution) parts.push(`ב${edu.institution}`);
    if (edu.year) parts.push(`(${edu.year})`);
    return parts.join(' ');
  };

  const formatLanguage = (lang: any) => {
    return `${lang.name}${lang.level ? ` - ${lang.level}` : ''}`;
  };

  return (
    <div className="cv-preview">
      <div className="preview-header">
        <button 
          className="back-button"
          onClick={onBack}
        >
          ← חזרה לתוצאות
        </button>
        <h2 className="preview-title">תצוגה מקדימה - קורות חיים</h2>
      </div>

      <div className="cv-content">
        {/* Personal Details */}
        <section className="cv-section">
          <h3 className="section-title">פרטים אישיים</h3>
          <div className="section-content">
            {cv.personal_details?.name && (
              <div className="detail-item">
                <strong>שם:</strong> {cv.personal_details.name}
              </div>
            )}
            {cv.personal_details?.email && (
              <div className="detail-item">
                <strong>אימייל:</strong> {cv.personal_details.email}
              </div>
            )}
            {cv.personal_details?.phone && (
              <div className="detail-item">
                <strong>טלפון:</strong> {cv.personal_details.phone}
              </div>
            )}
            {cv.personal_details?.address && (
              <div className="detail-item">
                <strong>כתובת:</strong> {cv.personal_details.address}
              </div>
            )}
            {cv.personal_details?.linkedin && (
              <div className="detail-item">
                <strong>LinkedIn:</strong> {cv.personal_details.linkedin}
              </div>
            )}
          </div>
        </section>

        {/* Summary */}
        {cv.summary && (
          <section className="cv-section">
            <h3 className="section-title">סיכום</h3>
            <div className="section-content">
              <p className="summary-text">{cv.summary}</p>
            </div>
          </section>
        )}

        {/* Experience */}
        {cv.experience && cv.experience.length > 0 && (
          <section className="cv-section">
            <h3 className="section-title">ניסיון תעסוקתי</h3>
            <div className="section-content">
              {cv.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    {formatExperience(exp)}
                  </div>
                  {exp.description && (
                    <div className="experience-description">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {cv.skills && cv.skills.length > 0 && (
          <section className="cv-section">
            <h3 className="section-title">כישורים</h3>
            <div className="section-content">
              <div className="skills-list">
                {cv.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education */}
        {cv.education && cv.education.length > 0 && (
          <section className="cv-section">
            <h3 className="section-title">השכלה</h3>
            <div className="section-content">
              {cv.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    {formatEducation(edu)}
                  </div>
                  {edu.details && (
                    <div className="education-details">
                      {edu.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {cv.languages && cv.languages.length > 0 && (
          <section className="cv-section">
            <h3 className="section-title">שפות</h3>
            <div className="section-content">
              <div className="languages-list">
                {cv.languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    {formatLanguage(lang)}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Additional Information */}
        {cv.additional && (
          <section className="cv-section">
            <div className="additional-toggle">
              <button 
                className="toggle-button"
                onClick={() => setShowAdditional(!showAdditional)}
              >
                {showAdditional ? '🔼 הסתר מידע נוסף' : '🔽 הצג מידע נוסף'}
              </button>
            </div>
            
            {showAdditional && (
              <div className="section-content">
                <h3 className="section-title">מידע נוסף</h3>
                <div className="additional-content">
                  <pre className="additional-text">{cv.additional}</pre>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default CVPreview;