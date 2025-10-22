import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

function TableComponent({ columns, data }: { columns: any, data: any }) {
    return (
        <div className="w-full ">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">#</TableHead>
                        {columns.map((col: any) => (
                            <TableHead key={col.key} className="text-left">{col.label}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row: any) => (
                        <TableRow key={row.id}>
                            <TableCell>
                                <div className='text-lg'>{data.indexOf(row) + 1}</div>
                            </TableCell>
                            {columns.map((col: any) => (
                                <TableCell key={col.key} className=''>
                                    <div className='text-lg '>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default TableComponent