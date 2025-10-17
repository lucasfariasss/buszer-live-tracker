import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BusData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
}

interface BusMapProps {
  buses: BusData[];
  selectedBusId: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

const BusMap = ({ buses, selectedBusId, onLocationUpdate }: BusMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Map<number, L.Marker>>(new Map());

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (!selectedBus) return;

    // Criar o mapa
    map.current = L.map(mapContainer.current, {
      center: [selectedBus.latitude, selectedBus.longitude],
      zoom: 13,
      zoomControl: false, // Desabilitar controle padrão para reposicioná-lo
    });

    // Adicionar tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Adicionar controle de zoom customizado posicionado
    const zoomControl = L.control.zoom({
      position: 'topright',
    });
    zoomControl.addTo(map.current);

    // Ajustar posição dos controles via CSS para ficarem abaixo do cartão
    setTimeout(() => {
      const zoomElement = document.querySelector('.leaflet-top.leaflet-right') as HTMLElement;
      if (zoomElement) {
        zoomElement.style.top = '270px';
      }
    }, 100);

    // Criar ícone customizado para o marcador (comum a todos)
    const createBusIcon = (isSelected: boolean) => L.divIcon({
      className: 'bus-marker',
      html: `<div style="
        width: 48px;
        height: 48px;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjE4IiBmaWxsPSIjM2I4MmY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNkgxOUMxOC40NDc3IDE2IDE4IDE2LjQ0NzcgMTggMTdWMjhDMTggMjguNTUyMyAxOC40NDc3IDI5IDE5IDI5SDI3QzI3LjU1MjMgMjkgMjggMjguNTUyMyAyOCAyOFYxN0MyOCAxNi40NDc3IDI3LjU1MjMgMTYgMjcgMTZaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgMjZIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMkgyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+');
        background-size: cover;
        cursor: pointer;
        opacity: ${isSelected ? '1' : '0.6'};
        transform: scale(${isSelected ? '1' : '0.85'});
        transition: all 0.3s ease;
      "></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    // Adicionar marcadores para todos os ônibus
    buses.forEach(bus => {
      const icon = createBusIcon(bus.id === selectedBusId);
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(map.current!);
      markers.current.set(bus.id, marker);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Atualizar marcadores quando os dados dos ônibus mudarem
  useEffect(() => {
    if (!map.current) return;

    const createBusIcon = (isSelected: boolean) => L.divIcon({
      className: 'bus-marker',
      html: `<div style="
        width: 48px;
        height: 48px;
        background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjE4IiBmaWxsPSIjM2I4MmY2Ii8+CjxwYXRoIGQ9Ik0yNyAxNkgxOUMxOC40NDc3IDE2IDE4IDE2LjQ0NzcgMTggMTdWMjhDMTggMjguNTUyMyAxOC40NDc3IDI5IDE5IDI5SDI3QzI3LjU1MjMgMjkgMjggMjguNTUyMyAyOCAyOFYxN0MyOCAxNi40NDc3IDI3LjU1MjMgMTYgMjcgMTZaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgMjZIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMkgyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+');
        background-size: cover;
        cursor: pointer;
        opacity: ${isSelected ? '1' : '0.6'};
        transform: scale(${isSelected ? '1' : '0.85'});
        transition: all 0.3s ease;
      "></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    buses.forEach(bus => {
      const marker = markers.current.get(bus.id);
      if (marker) {
        marker.setLatLng([bus.latitude, bus.longitude]);
        marker.setIcon(createBusIcon(bus.id === selectedBusId));
      }
    });

    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (selectedBus && onLocationUpdate) {
      onLocationUpdate(selectedBus.latitude, selectedBus.longitude);
    }
  }, [buses, selectedBusId, onLocationUpdate]);

  // Centralizar no ônibus selecionado
  useEffect(() => {
    if (!map.current) return;
    
    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (selectedBus) {
      map.current.flyTo([selectedBus.latitude, selectedBus.longitude], 13, {
        duration: 1,
      });
    }
  }, [selectedBusId, buses]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default BusMap;
