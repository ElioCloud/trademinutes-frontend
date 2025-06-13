// components/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 w-full">
      <div className="px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12 text-center">
          {/* Column 1: Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy" className="hover:text-blue-400">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:text-blue-400">Terms of Service</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-400">Contact Us</a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-400">About Us</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://facebook.com" className="hover:text-blue-400">Facebook</a>
              </li>
              <li>
                <a href="https://twitter.com" className="hover:text-blue-400">Twitter</a>
              </li>
              <li>
                <a href="https://linkedin.com" className="hover:text-blue-400">LinkedIn</a>
              </li>
              <li>
                <a href="https://instagram.com" className="hover:text-blue-400">Instagram</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <p className="mb-2">Email: <a href="mailto:info@yourdomain.com" className="hover:text-blue-400">info@yourdomain.com</a></p>
            <p>Phone: <a href="tel:+1234567890" className="hover:text-blue-400">+1 (234) 567-890</a></p>
          </div>
        </div>

        <div className="mt-8 text-center border-t border-gray-600 pt-4">
          <p>&copy; {new Date().getFullYear()} TradeMinutes. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
