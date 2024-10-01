interface Props {
  className?: string;
}
export default function MoveTaskIcon({className}: Props) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
    >
      <path
        d="M18.964 7.33301H10.964V9.33301H18.964V7.33301ZM6 9.16201V15.504L9.964 12.333L6 9.16201ZM18.964 11.333H10.964V13.333H18.964V11.333ZM10.964 15.333H18.964V17.333H10.964V15.333Z"
        fill="#787878"
      />
    </svg>
  );
}
