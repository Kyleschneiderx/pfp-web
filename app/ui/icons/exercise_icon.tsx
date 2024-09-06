"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";

interface Props {
  activeUrl: string;
}

export default function ExerciseIcon({ activeUrl }: Props) {
  const pathname = usePathname();
  return (
    <svg
      className={clsx(
        "w-6 h-6 text-neutral-400 group-hover:text-primary-500",
        pathname.startsWith(activeUrl) && "text-primary-500"
      )}
      width="22"
      height="24"
      viewBox="0 0 22 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Group">
        <g id="Group_2">
          <path
            id="Vector"
            d="M9.96642 20.4925C9.33873 20.4925 8.8218 20.3079 8.3418 19.9387C7.23411 19.0894 6.97565 17.5387 7.67719 15.8402C8.08334 14.8802 8.78488 14.2525 9.41257 13.6617C9.56027 13.5141 9.74488 13.3664 9.89257 13.1817C10.188 12.8864 10.668 12.8494 11.0003 13.1079L14.2864 15.6556C14.6187 15.9141 14.6926 16.3941 14.471 16.7633C14.1757 17.2064 13.9172 17.6125 13.6956 17.9817C13.3633 18.5356 12.9572 19.1633 12.3295 19.5694C11.6649 20.0125 11.0741 20.3079 10.4833 20.4187C10.2987 20.4556 10.1141 20.4925 9.96642 20.4925ZM10.5572 14.8802C10.5203 14.8802 10.5572 14.8802 10.5572 14.8802C9.96642 15.3971 9.48642 15.8402 9.22796 16.5048C9.11719 16.7633 8.63719 18.0556 9.41257 18.6464C9.63411 18.7941 9.81873 18.9048 10.2987 18.831C10.4833 18.7941 10.8526 18.6833 11.4433 18.2771C11.8126 18.0187 12.108 17.6125 12.3295 17.2064C12.4403 16.9848 12.588 16.8002 12.7357 16.5787L10.5572 14.8802Z"
          />
        </g>
        <g id="Group_3">
          <path
            id="Vector_2"
            d="M15.0618 15.6556C14.8772 15.6556 14.6926 15.5818 14.5449 15.471L11.3695 12.9971C11.0003 12.7018 10.9264 12.1848 11.2218 11.8156C11.2587 11.7787 11.2957 11.7418 11.3326 11.7048C12.0341 10.7448 12.1449 9.78483 12.2926 8.56637C12.3295 8.30791 12.3664 8.01252 12.4034 7.71714C12.6987 5.53868 13.6587 4.09868 15.2095 2.43714C15.8372 1.77252 16.9449 0.960215 18.1264 0.849446C18.828 0.7756 19.4557 0.997138 19.8987 1.21868C21.7449 2.10483 22.0034 4.28329 21.6341 5.83406C21.228 7.75406 20.5634 9.23098 19.5295 10.8925C18.828 12.0002 18.1634 12.7387 17.351 13.6248C17.1664 13.8464 16.9449 14.031 16.7603 14.2156C16.428 14.5479 16.0957 14.8802 15.8372 15.2494C15.8372 15.2494 15.8372 15.2494 15.8003 15.2864C15.7634 15.3233 15.7264 15.3971 15.6895 15.4341C15.5049 15.5448 15.2834 15.6556 15.0618 15.6556ZM15.7634 15.2864C15.7264 15.2864 15.7634 15.2864 15.7634 15.2864C15.7264 15.2864 15.7634 15.2864 15.7634 15.2864ZM13.031 12.1848L14.951 13.6618C15.1726 13.4402 15.3572 13.2187 15.5787 12.9971C15.7634 12.8125 15.948 12.6279 16.1326 12.4433C16.908 11.631 17.4987 10.9294 18.1634 9.93252C19.1234 8.4556 19.6772 7.16329 20.0464 5.42791C20.268 4.43098 20.1572 3.13868 19.1972 2.65868C18.9018 2.51098 18.5695 2.43714 18.311 2.47406C17.7572 2.51098 16.9818 2.99098 16.4649 3.54483C15.0987 5.02175 14.3234 6.16637 14.0649 7.93868C14.028 8.23406 13.991 8.49252 13.9541 8.75099C13.8064 9.93252 13.6957 11.0402 13.031 12.1848Z"
          />
        </g>
        <g id="Group_4">
          <path
            id="Vector_3"
            d="M3.17236 23.1877C2.98775 23.1877 2.80313 23.1508 2.5816 23.1138C1.6216 22.9292 1.1416 22.2646 0.809288 21.8215C0.440057 21.2677 0.329288 20.5292 0.255442 19.8646C0.181596 19.1261 0.366211 18.4615 0.550826 17.7969C0.698519 17.3169 0.846211 16.8369 0.993903 16.3938V16.3569C1.10467 15.9508 1.54775 15.6923 1.9539 15.8031L6.01544 16.6892C6.4216 16.7631 6.68006 17.1323 6.68006 17.5385C6.68006 17.76 6.64313 17.9815 6.64313 18.2031C6.60621 19.0523 6.60621 20.0492 6.12621 21.0092C5.57236 22.08 4.53852 23.1877 3.17236 23.1877ZM2.36006 17.5754C2.28621 17.7969 2.21236 18.0554 2.13852 18.2769C1.99083 18.7938 1.84313 19.2738 1.88006 19.68C1.91698 20.0492 1.99083 20.6031 2.17544 20.8985C2.4339 21.3415 2.65544 21.4523 2.87698 21.4892C3.61544 21.6369 4.28006 20.9354 4.61236 20.2338C4.94467 19.6061 4.94467 18.9046 4.9816 18.1292L2.36006 17.5754Z"
          />
        </g>
        <g id="Group_5">
          <path
            id="Vector_4"
            d="M6.34755 16.2462C6.2737 16.2462 6.23678 16.2462 6.16293 16.2093L2.24909 15.36C1.87986 15.2862 1.58447 14.9539 1.58447 14.5477C1.58447 14.4369 1.58447 14.3631 1.6214 14.2893C1.6214 14.2893 1.6214 14.2892 1.6214 14.2523C1.73216 13.7723 1.76909 13.2923 1.80601 12.8123C1.84293 12.5539 1.84293 12.2954 1.87986 12C2.02755 10.7446 2.17524 9.74771 2.50755 8.52925C3.02447 6.6831 3.76293 5.2431 4.94447 3.6554C6.16293 1.95694 8.00909 1.29233 9.55986 1.99387C10.1506 2.25233 10.6675 2.62156 10.9629 3.10156C11.6275 4.06156 11.7752 5.42771 11.6645 6.38771C11.406 8.38156 11.0737 10.1908 9.48601 12C9.30139 12.2216 9.07986 12.4431 8.89524 12.6277C8.04601 13.5508 7.45524 14.2154 7.15986 15.36C7.15986 15.3969 7.15986 15.4708 7.12293 15.4708C7.08601 15.6923 6.97524 15.8769 6.82755 16.0246C6.71678 16.1723 6.53216 16.2462 6.34755 16.2462ZM3.35678 13.92L5.71986 14.4369C6.12601 13.1816 6.90139 12.3693 7.67678 11.52C7.86139 11.3354 8.04601 11.1139 8.23063 10.8923C9.41216 9.5631 9.74447 8.27079 10.0029 6.2031C10.0768 5.46464 9.92909 4.57848 9.59678 4.06156C9.44909 3.87694 9.19063 3.69233 8.89524 3.54464C7.89832 3.10156 6.82755 3.87694 6.2737 4.68925C5.20293 6.09233 4.57524 7.34771 4.09524 9.00925C3.76293 10.08 3.65216 10.9662 3.50447 12.1846C3.46755 12.4062 3.46755 12.6646 3.43063 12.9231C3.43063 13.2554 3.43063 13.5877 3.35678 13.92Z"
          />
        </g>
      </g>
    </svg>
  );
}
