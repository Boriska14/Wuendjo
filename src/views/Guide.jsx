import React from 'react';
import { useApp } from '../ctx.js';
import { Compass, BookOpen, Key, AlertCircle } from 'lucide-react';

export default function Guide() {
  const { t, org } = useApp();

  return (
    <div>
      <div className="card card-hero dark-scope">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Compass size={20} color="var(--gold)" />
          <span className="pill primary">Manuel du Maître du Jeu Wuendjo</span>
        </div>
        <h1 className="big" style={{ margin: '0 0 6px', fontSize: '26px' }}>
          Guide de l'Organisateur & Animation
        </h1>
        <p className="mut" style={{ margin: 0, fontSize: '14px', maxWidth: '800px' }}>
          Conseils méthodologiques pour rythmer les journées, gérer la dynamique de groupe et faire vivre la légende des 4 clés.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>1. La dynamique des 4 Clés</h2>
          <details open>
            <summary>Jour 1 : Accueil, Brise-glace et Totems</summary>
            <p>
              Rassemblez les voyageurs dès l'arrivée. Attribuez les clans (Aigles et Lions) et distribuez le premier indice en début de soirée.
            </p>
          </details>
          <details>
            <summary>Jour 2 : Découverte culinaire et immersion</summary>
            <p>
              Favorisez les interactions avec les artisans et cuisiniers locaux. C'est l'occasion de faire goûter les spécialités et de valider l'épreuve du goût.
            </p>
          </details>
          <details>
            <summary>Jour 3 : Le grand défi physique ou d'orientation</summary>
            <p>
              Randonnée, expédition en pirogue ou course d'orientation. Assurez-vous que chacun participe selon ses capacités physiques.
            </p>
          </details>
          <details>
            <summary>Jour 4 : Clôture et récompense d'équipe</summary>
            <p>
              Remise des totems et célébration de tous les voyageurs. Pas de perdants : l'objectif est le souvenir commun.
            </p>
          </details>
        </div>

        <div className="card">
          <h2>2. Gestion sereine de la logistique</h2>
          <details open>
            <summary>Transparence financière</summary>
            <p>
              Utilisez l'onglet Budget avec son graphique Recharts pour montrer en temps réel la répartition entre transport, hébergement, repas et activités.
            </p>
          </details>
          <details>
            <summary>Sécurité & Santé en voyage</summary>
            <p>
              Gardez toujours à portée de main la trousse de secours, les contacts des centres de santé locaux et vérifiez l'hydratation de chacun.
            </p>
          </details>
          <details>
            <summary>Respect des cultures locales</summary>
            <p>
              Dans les chefferies et villages traditionnels, demandez toujours l'autorisation avant de photographier et respectez les usages vestimentaires.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
