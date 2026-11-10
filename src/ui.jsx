import React, { useState } from 'react';
import { Trash2, Check, X, AlertTriangle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

// Suppression en deux temps, sans boîte de dialogue : icône, puis « Supprimer ? Oui / Non ».
// Conforme WCAG 2.2 : zone tactile minimale 44x44px et annonces aria claires.
export function DeleteBtn({ onConfirm, label = 'Supprimer', disabled = false, title }) {
  const [ask, setAsk] = useState(false);

  if (ask) {
    return (
      <span className="del-confirm" role="group" aria-label={`Confirmation de suppression : ${label}`}>
        <span className="del-q" aria-live="polite">Supprimer ?</span>
        <button
          type="button"
          className="bad sm"
          onClick={() => { setAsk(false); onConfirm(); }}
          aria-label={`Confirmer la suppression définitive de ${label}`}
        >
          <Check size={14} /> Oui
        </button>
        <button
          type="button"
          className="subtle sm"
          onClick={() => setAsk(false)}
          aria-label="Annuler la suppression"
        >
          <X size={14} /> Non
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="icon-del"
      onClick={() => setAsk(true)}
      disabled={disabled}
      title={title || label}
      aria-label={label}
    >
      <Trash2 size={16} />
    </button>
  );
}

// Squelette de chargement accessible avec effet shimmer
export function Skeleton({ width = '100%', height = '18px', borderRadius = '6px', style = {}, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  );
}

// État vide guidé avec icon, explication et action suivante évidente
export function EmptyState({
  icon: Icon = Sparkles,
  title = 'Aucun élément pour l’instant',
  description = 'Commencez dès maintenant pour personnaliser cette section.',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {(actionText || secondaryActionText) && (
        <div className="empty-state-actions">
          {actionText && onAction && (
            <button type="button" className="accent sm" onClick={onAction}>
              {actionText} <ArrowRight size={14} />
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button type="button" className="subtle sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// État d'erreur accessible avec action de remédiation explicite
export function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger ces informations pour le moment.',
  onRetry,
  retryLabel = 'Réessayer'
}) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-icon" aria-hidden="true">
        <AlertTriangle size={22} />
      </div>
      <div className="error-state-body">
        <h4>{title}</h4>
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="accent sm" onClick={onRetry}>
            <RefreshCw size={14} /> {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Toast accessible non-bloquant
export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div
      className={`toast-notice ${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la notification"
          style={{ background: 'transparent', border: 'none', color: '#fff', padding: '4px', minHeight: '36px', minWidth: '36px' }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// Badge pour étiqueter explicitement tout contenu fictif / exemple
export function ExampleBadge({ label = 'Exemple' }) {
  return (
    <span className="example-badge" title="Contenu de démonstration non contractuel">
      {label}
    </span>
  );
}

