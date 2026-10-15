import { EduNote } from '@/components/EduNote';
import { Terminal } from '@/components/Terminal';

export default function Page() {
  return (
    <div className="app-frame">
      <noscript>
        <p className="edu-note">
          Protocol: Nightjar is an AP Cybersecurity classroom activity that runs in a simulated
          terminal. It needs JavaScript turned on to work.
        </p>
      </noscript>
      <Terminal />
      <EduNote />
    </div>
  );
}
