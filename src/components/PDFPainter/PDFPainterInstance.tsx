import { memo } from "react";

const PainterInstance = ({ instanceId, readOnly = false }: { instanceId: string; readOnly?: boolean }) => {
	return (
		<div>
			<div>{instanceId}</div>
			<div>{readOnly}</div>
		</div>
	);
};

export default memo(PainterInstance);
