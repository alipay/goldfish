import { getCurrent } from '../context/InstanceContext';

export default function useContainerType() {
  return getCurrent().getContainerType();
}
