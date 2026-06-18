import Image from "next/image";
import { RefreshCcw, User } from "lucide-react";
import type { Clan } from "@/lib/mock-data";
import { ProgressionChart } from "./PlayerSections";

export function ClanProfile({ clan }: { clan: Clan }) {
  return (
    <section className="clan-hero">
      <Image src={clan.badge} alt="" width={74} height={92} priority />
      <h1>{clan.name}<Image src="/images/flags/de.png" alt="Germany" width={26} height={18} /></h1>
      <strong>#{clan.tag} <span>TYPE: INVITE ONLY</span></strong>
      <p>{clan.description}</p>
      <div className="clan-summary">
        <Summary icon="/images/icons/trophy.png" value={clan.score.toLocaleString()} label="Clan Trophies" />
        <Summary icon="/images/icons/trophy.png" value={clan.warTrophies.toLocaleString()} label="Required Trophies" />
        <Summary icon="/images/icons/cardsq.png" value={clan.donations.toLocaleString()} label="Donations / Week" />
      </div>
    </section>
  );
}

export function ClanChestProgress() {
  return (
    <section className="clan-progress profile-section">
      <h2>Clan Chest Progression</h2>
      <div className="progress-columns">
        <ProgressItem icon="/images/clan-badges/16000004.png" label="160 crowns" total="/ 190 crowns" progress={64} />
        <ProgressItem icon="/images/icons/clock.png" label="Ends in:" total="7 days" progress={34} />
        <ProgressItem icon="/images/chests/megalightningchest.png" label="6 chests" total="/ 10 chests" progress={56} />
      </div>
    </section>
  );
}

export function ClanChart() {
  return <ProgressionChart title="Clan Progression" />;
}

export function MemberTable({ clan }: { clan: Clan }) {
  return (
    <section className="profile-section member-section">
      <div className="section-heading">
        <button type="button" className="filter-button">Trophies</button>
        <h2>Clan Members</h2>
        <div className="update-tools"><span>last updated 56 min ago</span><button type="button"><RefreshCcw size={16} />Refresh</button></div>
      </div>
      <div className="members-table-wrap">
        <table className="members-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Level</th>
              <th>League</th>
              <th>Trophies</th>
              <th>Crowns</th>
              <th>Donations</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {clan.members.map((member, index) => (
              <tr key={member.name} className={member.name === "Dark Light" ? "highlight" : ""}>
                <td>#{index + 1}</td>
                <td><strong>{member.name}</strong></td>
                <td><Image src="/images/levels/13.png" alt="13" width={34} height={34} /></td>
                <td><Image src="/images/arenas/league9.png" alt="" width={32} height={38} /></td>
                <td><Image src="/images/icons/trophy.png" alt="" width={25} height={25} /> <strong>{member.trophies}</strong></td>
                <td><Image src="/images/icons/crown-2d.png" alt="" width={26} height={22} />20</td>
                <td><Image src="/images/icons/book.png" alt="" width={22} height={25} />{member.donations}</td>
                <td><User size={20} />{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="load-more">Load More</button>
    </section>
  );
}

function Summary({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="summary-tile">
      <Image src={icon} alt="" width={36} height={36} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ProgressItem({ icon, label, total, progress }: { icon: string; label: string; total: string; progress: number }) {
  return (
    <div className="progress-item">
      <Image src={icon} alt="" width={58} height={58} />
      <strong>{label} <span>{total}</span></strong>
      <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
