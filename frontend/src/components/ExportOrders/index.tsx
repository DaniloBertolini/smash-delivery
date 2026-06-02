import { Button } from 'antd';

import { api } from '../../services/api';

export function ExportOrders() {
  const visibilityExportCsv = true;

  if (!visibilityExportCsv) {
    return null;
  }

  async function handleExport() {
    try {
      const response = await api.get('/orders/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pedidos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  }

  return (
    <Button type="primary" onClick={handleExport}>
      Exportar Excel
    </Button>
  );
}
