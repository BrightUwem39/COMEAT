import type { ReactNode } from "react";
import styles from "./AuraBackground.module.css";

type AuraBackgroundProps = {
  children?: ReactNode;
};

export default function AuraBackground({ children }: AuraBackgroundProps) {
  return (
    <div className={styles.aura}>
      <div aria-hidden="true" className={`${styles.layer} ${styles.layer1}`} />
      <div aria-hidden="true" className={`${styles.layer} ${styles.layer2}`} />
      <div aria-hidden="true" className={`${styles.layer} ${styles.layer3}`} />
      <div aria-hidden="true" className={`${styles.layer} ${styles.layer4}`} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
