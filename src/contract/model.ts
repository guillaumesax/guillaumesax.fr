export type ContractData = {
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  venue: string;
  venueAddress: string;
  startTime: string;
  endTime: string;
  prestation: string;
  options: string;
  quoteDate: string;
  total: string;
  deposit: string;
  specialTerms: string;
  signedCity: string;
  imagePermission: boolean | null;
  copyToClient: boolean;
};

export const emptyContract: ContractData = {
  clientName: '', clientAddress: '', clientEmail: '', clientPhone: '', eventDate: '',
  venue: '', venueAddress: '', startTime: '', endTime: '', prestation: '', options: '',
  quoteDate: '', total: '', deposit: '', specialTerms: '', signedCity: '',
  imagePermission: null, copyToClient: true,
};

export const contractVersion = 'Édition 2026-10 · rév. 2';

// Based on the local contrat_guillaume_sax_design_v2.pdf, selected by Guillaume.
export const clauses = [
  { title: '1. Objet de la prestation', text: 'Le présent contrat définit les conditions dans lesquelles Guillaume Mostafa réalise la prestation musicale décrite ci-dessus et dans le devis accepté par le Client.' },
  { title: '2. Documents contractuels', text: 'Le devis signé, la fiche technique fournie par le Prestataire et le présent contrat constituent l’ensemble contractuel. En cas de contradiction sur les éléments opérationnels ou tarifaires, le devis signé prévaut.' },
  { title: '3. Conditions techniques', text: 'Le Client s’engage à respecter la fiche technique remise avant la signature. Il garantit l’accès au lieu et un parking pour le déchargement, un espace sécurisé, une table stable et une protection contre les intempéries. Lorsque la sonorisation est fournie par le lieu, elle doit être conforme à la fiche technique. Toute difficulté doit être signalée au Prestataire avant l’événement afin de rechercher une solution adaptée.' },
  { title: '4. Conditions financières', text: 'Les montants, options et frais sont ceux du devis accepté par le Client. Un acompte de 30 % du montant total est demandé à la réservation. Le solde est réglé au plus tard la veille de la prestation. TVA non applicable, article 293 B du CGI.' },
  { title: '5. Annulation', text: 'Toute annulation est communiquée par écrit. En cas d’annulation par le Client, l’acompte de 30 % reste acquis au Prestataire et n’est jamais remboursé. Si le Client annule 30 jours ou plus avant la prestation, toute somme versée au-delà de l’acompte lui est remboursée. Si le Client annule moins de 30 jours avant la prestation, la totalité du montant du contrat est due ; les sommes déjà versées sont déduites du solde à payer. Si le Prestataire ne peut assurer la prestation, il en informe le Client dès que possible et lui rembourse intégralement les sommes versées pour la prestation non réalisée.' },
  { title: '6. Conditions particulières', text: 'Les parties prévoient un espace abrité adapté si la prestation doit avoir lieu en extérieur. En présence d’un danger pour les personnes ou le matériel, le Prestataire en informe le Client et les parties recherchent une solution sur place. Tout changement de lieu, d’horaire ou de contenu de prestation doit être convenu par écrit.' },
  { title: '7. Images et vidéos', text: 'L’utilisation promotionnelle d’images ou de vidéos captées pendant l’événement dépend du choix exprès du Client indiqué dans ce contrat.' },
  { title: '8. Acceptation', text: 'Le Client reconnaît avoir pris connaissance du présent contrat et de la fiche technique. Le devis accepté, la fiche technique et le présent contrat forment l’ensemble des documents applicables à la prestation.' },
];

export function formatEventDate(date: string) {
  if (!date) return '—';
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(parsed);
}

export function formatEuros(value: string) {
  if (!value || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value));
}
