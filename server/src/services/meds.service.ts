interface MedsSimplifyPayload {
  name: string;
}

interface MedsSimplifyResponse {
  name: string;
  what_it_does: string;
  effects_on_body: string[];
  common_side_effects: string[];
  discuss_with_doctor: string[];
}

export const simplifyMedication = ({ name }: MedsSimplifyPayload): MedsSimplifyResponse => {
  return {
    name,
    what_it_does: 'Example summary…',
    effects_on_body: ['Helps the body maintain balance.'],
    common_side_effects: ['Mild fatigue', 'Dry mouth'],
    discuss_with_doctor: ['Ensure dosage is appropriate.', 'Report unusual symptoms immediately.'],
  };
};
