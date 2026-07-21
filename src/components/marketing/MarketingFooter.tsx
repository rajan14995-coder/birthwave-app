export default function MarketingFooter() {
  return (
    <footer className="border-t border-rose/20 bg-plum px-4 py-10 text-blush/80">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-lg font-semibold text-white">The BirthWave</p>
          <p className="text-sm">The Holistic Women Wellness Space.</p>
          <div className="mt-3 flex gap-3 text-sm">
            <a href="https://www.facebook.com/thebirthwave" className="hover:text-white">Facebook</a>
            <a href="https://www.instagram.com/thebirthwave" className="hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@birthtoremember" className="hover:text-white">YouTube</a>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-white">Quick Links</p>
          <ul className="space-y-1 text-sm">
            <li>Home</li>
            <li>Blog</li>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Video Gallery</li>
            <li>Birth Stories</li>
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-white">Contact Info</p>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="tel:+919363031925" className="hover:text-white">93630 31925</a>
            </li>
            <li>
              <a href="mailto:drsantoshi@thebirthwave.com" className="hover:text-white">
                drsantoshi@thebirthwave.com
              </a>
            </li>
            <li>No 8/15 Mahalingapuram Main Road, Nungambakkam, Chennai 600034</li>
            <li>Open: Monday–Sunday, 7:30 AM – 9 PM</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
