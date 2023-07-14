import Link from "next/link"

export default function Footer({
  showReportProblem = false
}: {
    showReportProblem?: boolean
}) {
  return (
    <footer className="bg-white border-t border-neutral-200 ">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        {SocialIcons(showReportProblem)}
        <div className="mt-8  text-center md:mt-0 md:order-1 md:ml-8 md:text-left">
          <p className="text-base text-neutral-400">Sage Future Inc</p>
          <p className="text-neutral-300 my-1"><Link className="mr-4" href="/privacy">Privacy Policy</Link> <Link href="/terms">Terms of Use</Link></p>
        </div>
      </div>
    </footer>
  )
}

function SocialIcons(showReportProblem: boolean) {
  return <div className="flex justify-center space-x-6 md:order-2">
    {showReportProblem && <a
      key={"feedbackForm"}
      href="https://forms.gle/Tcg9Gtgc1C2UBWKA8"
      className="text-neutral-400 text-xs my-auto hover:text-neutral-500">
      Report a problem
    </a>}
    <a
      key={"eaforum"}
      href={"https://forum.effectivealtruism.org/users/sage"}
      className="text-neutral-400 hover:text-neutral-500"
    >
      <span className="sr-only">{"EA Forum"}</span>
      <svg
        width="428"
        height="600"
        viewBox="0 0 428 600"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-6 h-6"
      >
        <rect width="428" height="600" fill="white" />
        <path
          d="M149.933 490.987C149.933 498.278 155.877 504.188 163.21 504.188C225.025 504.188 255.475 505.336 272.215 530.686C276.453 536.097 284.151 537.38 289.932 533.64C295.713 529.899 297.651 522.381 294.391 516.337C269.04 478.072 224.64 478.072 163.21 478.072C155.877 478.072 149.933 483.983 149.933 491.274"
          fill="currentColor" />
        <path
          d="M149.932 438.038C149.932 445.329 155.878 451.239 163.21 451.239C226.468 451.239 264.855 454.013 269.521 467.55C268.463 470.132 265 472.715 254.128 474.724C237.388 477.881 210.834 477.833 174.37 477.785H163.21C155.878 477.785 149.932 483.696 149.932 490.987C149.932 498.278 155.878 504.188 163.21 504.188H184.472C217.28 504.188 241.573 503.901 259.035 500.649C276.497 497.396 288.523 489.935 293.574 478.742C295.295 475.162 296.277 471.275 296.46 467.31C296.42 463.507 295.67 459.744 294.247 456.214C282.221 424.645 226.612 424.645 163.306 424.645C159.735 424.619 156.303 426.025 153.787 428.545C151.271 431.065 149.881 434.487 149.932 438.038Z"
          fill="currentColor" />
        <path
          d="M213.913 64C155.269 63.975 102.001 97.9668 77.5951 150.987C53.1896 204.007 62.133 266.311 100.482 310.425C109.619 322.813 116.162 336.898 119.724 351.847C126.506 377.053 144.642 390.972 170.715 390.972H195.633C210.064 390.972 222.09 388.198 266.587 319.943C276.296 304.394 284.05 287.72 289.677 270.295C299.01 240.64 292.227 222.464 284.867 212.611C275.928 200.86 261.922 194.012 247.105 194.148C235.415 194.148 223.63 201.657 214.394 210.219C208.291 216.177 203.635 223.44 200.78 231.456C199.133 236.063 198.287 240.916 198.279 245.805C197.8 254.771 204.221 262.643 213.143 264.029C221.417 264.029 228.296 253.841 228.296 245.853C228.234 241.292 227.505 236.765 226.131 232.413C231.293 225.867 238.851 221.62 247.153 220.598C253.575 220.506 259.681 223.365 263.701 228.347C269.089 235.617 269.377 247.479 264.615 262.69C259.604 277.491 253.041 291.727 245.036 305.164C233.295 324.712 219.386 342.89 203.57 359.356C200.529 363.034 195.945 365.101 191.159 364.952H170.763C156.909 364.952 149.068 358.925 145.412 345.389C136.416 311.908 121.696 294.736 120.686 293.588C85.0657 252.404 80.936 192.828 110.537 147.174C140.138 101.52 196.416 80.6662 248.846 95.9235C301.277 111.181 337.367 158.914 337.541 213.232C337.529 243.898 326.933 273.631 307.524 297.463C303.243 302.246 276.4 334.006 276.4 391.977C276.4 408.335 241.477 424.789 163.451 424.789C156.118 424.789 150.174 430.699 150.174 437.99C150.174 445.281 156.118 451.191 163.451 451.191C284.819 451.191 302.954 414.122 302.954 391.977C302.954 341.706 326.189 316.308 327.295 315.112L327.536 314.778C351.197 286.213 364.093 250.334 364 213.328C364.025 173.733 348.223 135.75 320.074 107.743C291.924 79.7358 253.735 64 213.913 64Z"
          fill="currentColor" />
        <path
          d="M142.718 213.759C132.038 229.017 130.74 249.871 139.11 272.495C146.951 293.78 165.856 315.543 179.71 329.462C184.811 334.626 193.157 334.701 198.351 329.629C203.545 324.557 203.62 316.259 198.519 311.095C181.73 294.115 168.646 276.513 163.836 263.264C158.544 248.914 158.736 236.622 164.317 228.586C168.743 222.659 175.854 219.321 183.27 219.69C190.557 220.779 196.958 225.087 200.684 231.408C203.537 223.391 208.193 216.128 214.297 210.171C206.36 201.514 195.729 193.43 183.27 193.43C167.242 193.041 152.059 200.563 142.718 213.519"
          fill="currentColor" />
        <defs>
          <linearGradient
            id="paint0_linear_181_373"
            x1="260.566"
            y1="535.777"
            x2="260.566"
            y2="513.238"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0E879C" />
            <stop offset="1" stopColor="#1B5266" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_181_373"
            x1="166.893"
            y1="473.119"
            x2="166.893"
            y2="424.645"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0E879C" />
            <stop offset="1" stopColor="#1B5266" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_181_373"
            x1="163.804"
            y1="278.714"
            x2="211.518"
            y2="229.432"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0E879C" />
            <stop offset="1" stopColor="#1B5266" />
          </linearGradient>
        </defs>
      </svg>
    </a>
    <a
      key={"discord"}
      href={"https://discord.gg/mt9YVB8VDE"}
      className="text-neutral-400 hover:text-neutral-500"
    >
      <span className="sr-only">{"Discord"}</span>
      <svg
        fill="currentColor"
        width="71"
        height="55"
        viewBox="0 0 71 55"
        className="w-6 h-6"
      >
        <path
          clipPath="url(#clip0)"
          d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
      </svg>
    </a>
    <a
      key={"twitter"}
      href={"https://twitter.com/sage_future_"}
      className="text-neutral-400 hover:text-neutral-500"
    >
      <span className="sr-only">{"Twitter"}</span>
      <svg
        fill="currentColor"
        width="65"
        height="55"
        className="w-6 h-6"
        viewBox="0 0 24 24"
      >
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    </a>
  </div>
}
