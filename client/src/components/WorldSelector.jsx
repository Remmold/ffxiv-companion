import { dataCenters, dcByRegion, regionOrder } from '../data/ffxivData';

export default function WorldSelector({ value, onChange }) {
    // Flatten the structure since HTML doesn't support nested optgroups
    const options = [];

    regionOrder.forEach(region => {
        dcByRegion[region].forEach(dc => {
            options.push({
                type: 'group',
                label: `${dc} (${region})`,
                worlds: dataCenters[dc]
            });
        });
    });

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
                World / Server
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="select-field w-full"
            >
                <option value="">Select a world...</option>

                {options.map(group => (
                    <optgroup key={group.label} label={group.label}>
                        {group.worlds.map(world => (
                            <option key={world} value={world}>
                                {world}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    );
}
