import { useState } from 'react';

import { Button, message, Tag, Upload } from 'antd';
import { api } from '../../services/api';
import {
 getOrders,
} from '../../services/orders';

import {
 useOrders,
} from '../../hooks/useOrders';

export function ImportOrders() {
  const visibilityImportCsv = false
  if (!visibilityImportCsv) {
    return null;
  }

  const [fileName, setFileName] =
    useState<string>();

  const {
    setOrders,
    } = useOrders();

  return (
    <>
      <Upload
        accept=".xlsx,.xls"
        showUploadList={false}
        beforeUpload={async (
          file,
        ) => {
          try {
            setFileName(
              file.name,
            );

            const form =
              new FormData();

            form.append(
              'file',
              file,
            );

            await api.post(
              '/orders/import',
              form,
            );

            message.success(
              'Pedidos importados',
            );

            const orders =
              await getOrders();

            setOrders(
              orders,
            );
          } catch {
            message.error(
              'Erro ao importar',
            );
          }

          return false;
        }}
      >
        <Button type="primary">
          Importar Excel
        </Button>
      </Upload>

      {fileName && (
        <Tag color="blue">
          Arquivo selecionado:
          {' '}
          {fileName}
        </Tag>
      )}
    </>
  );
}