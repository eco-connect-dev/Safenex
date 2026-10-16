import { createElement, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { categoryColor, type OperationsMapFeature } from "./operationsMapTypes";

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type Props = { features: OperationsMapFeature[]; selectedId?: string | null; onSelect?: (id: string) => void; testID?: string };

export function OperationsMap({ features, selectedId, onSelect, testID = "operations-map" }: Props) {
    const frameRef = useRef<HTMLIFrameElement>(null);
    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.source !== frameRef.current?.contentWindow || event.data?.type !== "operations-map-select") return;
            if (typeof event.data.id === "string" && features.some((feature) => feature.id === event.data.id)) onSelect?.(event.data.id);
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [features, onSelect]);
    const srcDoc = useMemo(() => {
        const points = features.map((feature) => ({ ...feature, color: categoryColor(feature.category), selected: feature.id === selectedId }));
        const safePoints = JSON.stringify(points).replace(/</g, "\\u003c");
        const center = points.length
            ? [points.reduce((sum, point) => sum + point.latitude, 0) / points.length, points.reduce((sum, point) => sum + point.longitude, 0) / points.length]
            : [7.2523, 80.3436];
        const safeCenter = JSON.stringify(center);
        const suppressExtensionErrors = "<script>(function(){window.addEventListener('error',function(e){if(e&&(e.filename||'').indexOf('chrome-extension:')!==-1){e.preventDefault();e.stopImmediatePropagation();}},true);})();</script>";
        return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">${suppressExtensionErrors}<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;width:100%;margin:0;background:#e8f0f8} .leaflet-popup-content{font:13px Arial,sans-serif}.load{position:absolute;z-index:1000;top:8px;left:8px;padding:6px 9px;border-radius:5px;background:#fff;font:11px Arial;color:#475569;box-shadow:0 1px 4px #0003}</style></head><body><div id="map"></div><div id="load" class="load">Loading OpenStreetMap…</div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>(function(){var points=${safePoints};var center=${safeCenter};if(!window.L){document.getElementById('load').textContent='Map library unavailable. Check your internet connection.';return;}var map=L.map('map',{scrollWheelZoom:true}).setView(center,10);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:${JSON.stringify(attribution)}}).addTo(map);document.getElementById('load').remove();function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}points.forEach(function(p){var marker=L.circleMarker([p.latitude,p.longitude],{radius:p.selected?10:(p.category==='hazard'?9:7),color:'#fff',weight:p.selected?4:2,fillColor:p.color,fillOpacity:1}).addTo(map);marker.bindPopup('<strong>'+esc(p.name)+'</strong><br>'+esc(p.detail||p.category));if(p.category==='location'||p.category==='hazard'){marker.bindTooltip(esc(p.name),{permanent:true,direction:'right',offset:[6,0]});}marker.on('click',function(){window.parent.postMessage({type:'operations-map-select',id:p.id},'*');});});if(points.length>1){map.fitBounds(L.latLngBounds(points.map(function(p){return [p.latitude,p.longitude];})).pad(0.18));}})();</script></body></html>`;
    }, [features, selectedId]);

    return <View style={styles.container} testID={testID}>{createElement("iframe", {
        title: "Interactive OpenStreetMap emergency coordination map",
        ref: frameRef,
        srcDoc,
        loading: "lazy",
        style: { border: 0, display: "block", height: "100%", width: "100%" },
    })}</View>;
}

const styles = StyleSheet.create({ container: { borderRadius: 10, height: 280, minHeight: 220, overflow: "hidden", width: "100%" } });
