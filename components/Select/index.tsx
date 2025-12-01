import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import Icon from "@/components/Icon";

type SelectOption = {
    id: number;
    name: string;
};

type SelectProps = {
    className?: string;
    classButton?: string;
    value: SelectOption;
    onChange: (value: SelectOption) => void;
    options: SelectOption[];
};

const Select = ({
    className,
    classButton,
    value,
    onChange,
    options,
}: SelectProps) => {
    return (
        <Listbox
            className={`${className || ""}`}
            value={value}
            onChange={onChange}
            as="div"
        >
            <ListboxButton
                className={`group flex justify-between items-center w-full h-12 pl-5 pr-3 bg-b-surface2 rounded-full text-button text-t-secondary transition-all outline-0 data-hover:shadow-hover data-hover:text-t-primary data-open:shadow-none data-open:text-t-primary ${
                    classButton || ""
                }`}
            >
                {value.name}
                <Icon
                    className="shrink-0 ml-3 fill-t-secondary transition-all group-data-hover:fill-t-primary group-data-open:rotate-180 group-data-open:fill-t-primary"
                    name="chevron"
                />
            </ListboxButton>
            <ListboxOptions
                className="z-100 [--anchor-gap:0.25rem] w-(--button-width) p-2.5 bg-b-surface2 rounded-3xl shadow-hover origin-top transition duration-200 ease-out outline-none data-closed:scale-95 data-closed:opacity-0"
                anchor="bottom"
                transition
                modal={false}
            >
                {options.map((option) => (
                    <ListboxOption
                        className="relative w-full pl-2.5 pr-6 py-2 rounded-full text-left text-button text-t-secondary cursor-pointer transition-colors after:absolute after:top-3.5 after:right-2.5 after:size-2 after:rounded-full after:bg-t-blue after:opacity-0 after:transition-opacity data-focus:bg-b-highlight data-focus:text-t-primary data-selected:after:opacity-100 data-selected:text-t-primary"
                        key={option.id}
                        value={option}
                    >
                        {option.name}
                    </ListboxOption>
                ))}
            </ListboxOptions>
        </Listbox>
    );
};

export default Select;
