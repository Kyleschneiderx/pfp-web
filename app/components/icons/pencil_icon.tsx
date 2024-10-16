interface Props {
  className?: string;
  onClick?: () => void;
}
export default function PencilIcon({ className, onClick }: Props) {
  return (
    <svg
      onClick={onClick}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M15.4525 9.81852L15.448 9.82482L9.02434 16.2491L10.9495 18.1736L17.3786 11.7448L15.4525 9.81852Z"
        fill="#736CED"
      />
      <path
        d="M5.82559 13.05L7.75078 14.9763L14.1753 8.55203L14.1816 8.54753L12.2546 6.62034L5.82559 13.05Z"
        fill="#736CED"
      />
      <path
        d="M4.79594 14.5658L3.04625 19.8145C2.93824 20.1377 3.02285 20.495 3.26406 20.7354C3.43507 20.9073 3.66548 21 3.90039 21C3.9958 21 4.0921 20.9847 4.18481 20.9532L9.43297 19.2033L4.79594 14.5658Z"
        fill="#736CED"
      />
      <path
        d="M19.9401 4.05856C18.5279 2.64715 16.2292 2.64715 14.817 4.05856L13.5282 5.34755L18.6521 10.472L19.941 9.18303C21.3532 7.77072 21.3532 5.47087 19.9401 4.05856Z"
        fill="#736CED"
      />
    </svg>
  );
}
