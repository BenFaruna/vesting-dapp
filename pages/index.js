import styles from '../styles/style.module.css';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className={styles.main}>
          <h2>Welcome to Vesting Scheduling Dapp</h2>
          <p>Get Started</p>
          <div>
            <p>
              Go to &nbsp;
              <Link className="a" href='/organization'>
                Organization
              </Link> &nbsp; or &nbsp;
              <Link className="a" href='/stakeholder'>
                Stakeholder
              </Link>
            </p>
          </div>
    </main>
  )
}
