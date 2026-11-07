export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
      <>
        {/* EN পেজে html lang="en" বসায় (root layout স্ট্যাটিক রাখার জন্য) */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.lang="en"',
          }}
        />
        {children}
      </>
    );
  }