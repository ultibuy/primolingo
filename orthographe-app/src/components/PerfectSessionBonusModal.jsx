import PopupModal from './PopupModal.jsx';
import RewardMoment from './rewards/RewardMoment.jsx';

export default function PerfectSessionBonusModal({ bonus = 10, onContinue }) {
  return (
    <PopupModal
      onClose={onContinue}
      panelStyle={{ width: 'min(460px, calc(100vw - 2rem))', padding: '0.5rem' }}
    >
      <RewardMoment
        icon="trophy"
        kicker="Session parfaite"
        title="20/20. Bonus parfait."
        amount={`+${bonus}`}
        unit="coins"
        description="Bravo pour cette session sans erreur !"
        actionLabel="Voir le récapitulatif"
        onAction={onContinue}
      />
    </PopupModal>
  );
}
