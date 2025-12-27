import { useEffect, useRef, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";

/* ---------- GST ROUNDING (GST PORTAL STYLE) ---------- */
const round2 = (v) => Math.round(v * 100) / 100;

export default function ShippingLabel({ order, settings }) {
  const barcodeRef = useRef(null);

  /* ---------- COURIER CONFIG + BARCODE FORMAT ---------- */
  const courier = useMemo(() => {
    const name = order?.courier?.toLowerCase() || "delhivery";
    const isCOD = order?.is_cod;

    if (name.includes("shadowfax"))
      return {
        label: "Shadowfax",
        barcodeFormat: "CODE128",
        tracking: order.tracking_number?.toUpperCase(),
        paymentText: isCOD
          ? "COD: Check the payable amount on the app"
          : "Prepaid: Do not collect cash",
      };

    if (name.includes("valmo"))
      return {
        label: "Valmo",
        barcodeFormat: "CODE39",
        tracking: order.tracking_number,
        paymentText: isCOD
          ? "COD: Check the payable amount on the app"
          : "Prepaid: Do not collect cash",
      };

    return {
      label: "Delhivery",
      barcodeFormat: "CODE128",
      tracking: order.tracking_number,
      paymentText: isCOD
        ? "COD: Check the payable amount on the app"
        : "Prepaid: Do not collect cash",
    };
  }, [order]);

  /* ---------- BARCODE ---------- */
  useEffect(() => {
    if (barcodeRef.current && courier.tracking) {
      JsBarcode(barcodeRef.current, courier.tracking, {
        format: courier.barcodeFormat,
        width: 2,
        height: 55,
        displayValue: true,
        fontSize: 12,
        margin: 0,
      });
    }
  }, [courier]);

  /* ---------- HELPERS ---------- */
  const getReturnCode = () => {
    const pin = settings?.pincode || order.shipping_address?.pincode || "";
    return `${pin},${Math.floor(1000000 + Math.random() * 9000000)}`;
  };

  const getDestinationCode = () => {
    const city = order.shipping_address?.city?.replace(/\s+/g, "");
    const state = order.shipping_address?.state?.split(" ")[0];
    return `${city}_${state}_D`;
  };

  const isIntraState =
    order.shipping_address?.state === settings?.state;

  /* ---------- GST CALCULATIONS (PORTAL ACCURATE) ---------- */
  const getTaxBreakup = (taxable, rate) => {
    if (isIntraState) {
      const half = round2((taxable * rate) / 200);
      return {
        cgst: half,
        sgst: half,
        totalTax: round2(half + half),
      };
    }
    const igst = round2((taxable * rate) / 100);
    return { igst, totalTax: igst };
  };

  /* ================= UI ================= */
  return (
    <div
      className="shipping-label"
      style={{ width: "4in", minHeight: "6in", fontFamily: "Arial" }}
    >
      {/* ============ HEADER ============ */}
      <div className="grid grid-cols-2 border-2 border-black">
        <div className="p-2 border-r-2 border-black text-xs">
          <div className="font-bold">Customer Address</div>
          <div className="font-bold text-base">
            {order.shipping_address?.name}
          </div>
          <div>{order.shipping_address?.line1}</div>
          {order.shipping_address?.line2 && (
            <div>{order.shipping_address.line2}</div>
          )}
          <div>
            {order.shipping_address?.city},{" "}
            {order.shipping_address?.state},{" "}
            {order.shipping_address?.pincode}
          </div>

          <div className="mt-3 font-bold">If undelivered, return to:</div>
          <div className="font-bold">{settings.company_name}</div>
          <div>{settings.address}</div>
          <div>
            {settings.city}, {settings.state}, {settings.pincode}
          </div>
        </div>

        <div className="p-2 text-xs">
          <div className="bg-black text-white px-2 py-1 font-bold mb-2">
            {courier.paymentText}
          </div>

          <div className="font-bold text-lg">{courier.label}</div>
          <div className="bg-black text-white inline-block px-2 text-xs">
            Pickup
          </div>

          <div className="grid grid-cols-2 mt-2">
            <div>
              <div className="font-bold">Destination Code</div>
              <div>{getDestinationCode()}</div>
            </div>
            <QRCodeSVG value={courier.tracking} size={80} />
          </div>

          <div className="mt-1">
            <strong>Return Code</strong>
            <div>{getReturnCode()}</div>
          </div>

          <svg ref={barcodeRef} className="mx-auto mt-2"></svg>
        </div>
      </div>

      {/* ============ INVOICE ============ */}
      <table className="w-full text-xs border-t border-black">
        <thead>
          <tr className="border-b border-black">
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Taxable</th>
            <th>Taxes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => {
            const taxable = round2(item.price / (1 + item.tax_rate / 100));
            const tax = getTaxBreakup(taxable, item.tax_rate);

            return (
              <tr key={i}>
                <td>{item.product_name}</td>
                <td>{item.hsn_code}</td>
                <td>{item.quantity}</td>
                <td>Rs.{taxable.toFixed(2)}</td>
                <td>
                  {isIntraState ? (
                    <>
                      CGST 9%: Rs.{tax.cgst.toFixed(2)}
                      <br />
                      SGST 9%: Rs.{tax.sgst.toFixed(2)}
                    </>
                  ) : (
                    <>IGST {item.tax_rate}%: Rs.{tax.igst.toFixed(2)}</>
                  )}
                </td>
                <td>
                  Rs.{round2(taxable + tax.totalTax).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style jsx>{`
        @media print {
          .shipping-label {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
