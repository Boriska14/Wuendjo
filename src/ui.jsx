import React, { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';

// Suppression en deux temps, sans boîte de dialogue : icône, puis « Supprimer ? Oui / Non ».
export function DeleteBtn({ onConfirm, label = 'Supprimer', disabled = false, title }) {
  const [ask, setAsk] = useState(false);

  if (ask) {
    return (
      <span className="del-confirm">
        <span className="del-q">Supprimer ?</span>
        <button type="button" className="bad sm" onClick={() => { setAsk(false); onConfirm(); }} aria-label="Confirmer la suppression">
          <Check size={13} /> Oui
        </button>
        <button type="button" className="subtle sm" onClick={() => setAsk(false)} aria-label="Annuler">
          <X size={13} /> Non
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
      <Trash2 size={15} />
    </button>
  );
}
